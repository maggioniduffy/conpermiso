import AuthAlternatives from "@/components/Auth/AuthAlternatives";
import AuthHeader from "@/components/Auth/AuthHeader";
import { signIn } from "@/auth";
import Link from "next/link";

const page = () => {
  async function handleSignIn(formData: FormData) {
    "use server";

    const email = formData.get("email")?.toString();
    console.log("Email:", email);
    await signIn("resend", {
      email: email || "",
      redirect: true,
      callbackUrl: "/link-sent",
      redirectTo: "/",
    });
  }

  return (
    <main className="w-full bg-mywhite h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-gray-600 space-y-8">
        <AuthHeader />
        <form action={handleSignIn}>
          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              required
              name="email"
              className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 text-mywhite font-medium bg-principal-200 hover:bg-principal-500 active:bg-principal-600 rounded-lg duration-150"
          >
            Inicia Sesion o Crea tu Cuenta
          </button>
        </form>
        <AuthAlternatives />

        {/* Link a la landing */}
        <p className="text-center text-xs text-jet-700">
          ¿No sabés qué es KKapp?{" "}
          <Link
            href="/welcome"
            className="text-principal font-semibold hover:underline"
          >
            ¿Cómo funciona?
          </Link>
        </p>
      </div>
    </main>
  );
};

export default page;
