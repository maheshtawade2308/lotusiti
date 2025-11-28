import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid credentials" }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.id,
          email: data.email,
          role: data.role,
        },
      }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
