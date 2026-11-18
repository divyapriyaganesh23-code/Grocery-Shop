// Supabase Edge Function: verify-otp
// Secure Server-Side Delivery OTP Verification
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { orderId, otpEntered, workerId } = await req.json();

    if (!orderId || !otpEntered) {
      return new Response(
        JSON.stringify({ success: false, message: "Order ID and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch verification record
    const { data: record, error: fetchErr } = await supabaseClient
      .from("delivery_verifications")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (fetchErr || !record) {
      return new Response(
        JSON.stringify({ success: false, message: "No active verification found for this order" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (record.is_verified) {
      return new Response(
        JSON.stringify({ success: false, message: "Order has already been verified and delivered." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new Date() > new Date(record.expires_at)) {
      return new Response(
        JSON.stringify({ success: false, message: "OTP has expired. Please contact support." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (record.attempts >= record.max_attempts) {
      return new Response(
        JSON.stringify({ success: false, message: "Maximum verification attempts exceeded. Order locked." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash user-entered OTP to compare with stored hash
    const encoder = new TextEncoder();
    const data = encoder.encode(otpEntered.trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const inputHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const isValid = inputHash === record.otp_hash || otpEntered.trim() === record.otp_plain_demo;

    if (!isValid) {
      await supabaseClient
        .from("delivery_verifications")
        .update({ attempts: record.attempts + 1 })
        .eq("id", record.id);

      const remaining = record.max_attempts - (record.attempts + 1);
      return new Response(
        JSON.stringify({ success: false, message: `Incorrect OTP. ${remaining} attempts remaining.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as verified & transition order to 'delivered'
    const now = new Date().toISOString();
    await supabaseClient
      .from("delivery_verifications")
      .update({ is_verified: true, verified_at: now })
      .eq("id", record.id);

    await supabaseClient
      .from("orders")
      .update({
        status: "delivered",
        payment_status: "paid",
        delivered_at: now,
        updated_at: now
      })
      .eq("id", orderId);

    // Notify customer
    const { data: orderData } = await supabaseClient
      .from("orders")
      .select("customer_id")
      .eq("id", orderId)
      .single();

    if (orderData?.customer_id) {
      await supabaseClient.from("notifications").insert({
        user_id: orderData.customer_id,
        title: "Order Delivered!",
        message: `Your grocery order #${orderId} was successfully verified and delivered. Thank you for shopping with FreshCart!`,
        type: "order"
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Delivery verified successfully!", orderId, deliveredAt: now }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
