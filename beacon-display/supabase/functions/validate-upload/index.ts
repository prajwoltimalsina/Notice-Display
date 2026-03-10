import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed MIME types and their magic bytes
const ALLOWED_TYPES: Record<string, { mimeType: string; magicBytes: number[][] }> = {
  'png': {
    mimeType: 'image/png',
    magicBytes: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]]
  },
  'jpg': {
    mimeType: 'image/jpeg',
    magicBytes: [[0xFF, 0xD8, 0xFF]]
  },
  'jpeg': {
    mimeType: 'image/jpeg',
    magicBytes: [[0xFF, 0xD8, 0xFF]]
  },
  'pdf': {
    mimeType: 'application/pdf',
    magicBytes: [[0x25, 0x50, 0x44, 0x46]] // %PDF
  }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function checkMagicBytes(buffer: Uint8Array, expectedBytes: number[][]): boolean {
  return expectedBytes.some(expected => {
    if (buffer.length < expected.length) return false;
    return expected.every((byte, index) => buffer[index] === byte);
  });
}

function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts[parts.length - 1];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.log('Unauthorized user attempt:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const filename = formData.get('filename') as string | null;

    if (!file || !filename) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check extension
    const extension = getFileExtension(filename);
    const allowedType = ALLOWED_TYPES[extension];
    
    if (!allowedType) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only PNG, JPG, JPEG, and PDF are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate magic bytes
    const buffer = new Uint8Array(await file.arrayBuffer());
    const isValidMagicBytes = checkMagicBytes(buffer, allowedType.magicBytes);
    
    if (!isValidMagicBytes) {
      return new Response(
        JSON.stringify({ error: 'File content does not match its extension. Please upload a valid file.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for double extensions (e.g., file.pdf.exe)
    const parts = filename.split('.');
    if (parts.length > 2) {
      const suspiciousExtensions = ['exe', 'bat', 'cmd', 'sh', 'js', 'vbs', 'ps1', 'msi'];
      const hasDoubleExtension = parts.slice(0, -1).some(part => 
        suspiciousExtensions.includes(part.toLowerCase())
      );
      if (hasDoubleExtension) {
        return new Response(
          JSON.stringify({ error: 'Invalid filename detected.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('File validated successfully:', filename);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        mimeType: allowedType.mimeType,
        size: file.size,
        filename: filename
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: 'File validation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
