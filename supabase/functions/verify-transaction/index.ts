
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyRequest {
  transactionHash: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    })
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
    
    // Get auth user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }
    
    // Get the token from the auth header
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }
    
    // Parse request
    const { transactionHash } = await req.json() as VerifyRequest
    
    if (!transactionHash) {
      return new Response(
        JSON.stringify({ error: 'Transaction hash is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }
    
    // Check if transaction exists in our database
    const { data, error } = await supabaseClient
      .from('blockchain_transactions')
      .select('*')
      .eq('hash', transactionHash)
      .single()
    
    if (error) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found', details: error.message }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      )
    }
    
    // In a real application, you would connect to a blockchain node and verify the transaction
    // For this demo, we'll just consider transactions in our database as "verified"
    
    return new Response(
      JSON.stringify({ 
        verified: true, 
        transaction: {
          hash: data.hash,
          blockNumber: data.block_number,
          from: data.from_address,
          to: data.to_address,
          status: data.status,
          timestamp: data.timestamp
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    )
  }
})
