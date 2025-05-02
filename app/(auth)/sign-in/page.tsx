import AuthAlternatives from "@/components/AuthAlternatives";
import AuthHeader from "@/components/AuthHeader";

const page = () => {
  return (
    <main className="w-full bg-mywhite h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-gray-600 space-y-8">
        <AuthHeader authCase="sign-in" />
        <form>
          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
            />
          </div>
          <button className="w-full mt-4 px-4 py-2 text-mywhite font-medium bg-principal-200 hover:bg-principal-500 active:bg-principal-600 rounded-lg duration-150">
            Sign in
          </button>
        </form>
        <AuthAlternatives />
      </div>
    </main>
  );
};

export default page;
