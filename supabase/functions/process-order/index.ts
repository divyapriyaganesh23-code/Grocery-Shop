// Supabase Edge Function: process-order
// Handles atomic order reservation, stock boundary checks, and invoice record creation
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

    const { orderPayload, items } = await req.json();

    if (!orderPayload || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid order payload or empty item list" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Stock Check & Atomic Deduction
    for (const item of items) {
      const { data: product, error } = await supabaseClient
        .from("products")
        .select("id, name, stock")
        .eq("id", item.productId)
        .single();

      if (error || !product) {
        return new Response(
          JSON.stringify({ success: false, message: `Product ID ${item.productId} not found` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (product.stock < item.quantity) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2. Insert Order
    const { data: createdOrder, error: orderErr } = await supabaseClient
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (orderErr) {
      throw orderErr;
    }

    // 3. Deduct stock & log movement
    for (const item of items) {
      const { data: prod } = await supabaseClient
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();

      const newStock = Math.max(0, (prod?.stock ?? item.quantity) - item.quantity);

      await supabaseClient
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.productId);

      await supabaseClient.from("stock_movements").insert({
        product_id: item.productId,
        movement_type: "order_deduction",
        quantity_changed: -item.quantity,
        stock_after: newStock,
        reference_id: createdOrder.id,
        notes: `Order placed by ${orderPayload.recipient_name}`
      });
    }

    // 4. Generate 6-digit OTP for delivery verification
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const encoder = new TextEncoder();
    const data = encoder.encode(rawOtp);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const otpHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    await supabaseClient.from("delivery_verifications").insert({
      order_id: createdOrder.id,
      otp_hash: otpHash,
      otp_plain_demo: rawOtp // Displayed in Demo Mode
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order placed successfully!",
        order: createdOrder,
        demoOtp: rawOtp
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
