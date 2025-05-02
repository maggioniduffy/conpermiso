import Image from "next/image";

interface Props {
  title: string;
  alternative: {
    href: string;
    message: string;
    question: string;
  };
}

type AuthCase = "sign-in" | "sign-up";

const options = new Map<AuthCase, Props>();

options.set("sign-in", {
  title: "Entra a tu cuenta",
  alternative: {
    href: "/sign-up",
    question: "No tenes cuenta?",
    message: "Registrate",
  },
});

options.set("sign-up", {
  title: "Crea una cuenta",
  alternative: {
    href: "/sign-in",
    question: "Ya tenes cuenta?",
    message: "Inicia sesión",
  },
});

interface Case {
  authCase: AuthCase;
}

const AuthHeader = ({ authCase }: Case) => {
  const props = options.get(authCase);

  return (
    <div className="text-center mb-10">
      <Image
        src="/longlogo_white.png"
        width={450}
        height={250}
        className="mx-auto"
        alt="logo"
      />
      <div className="mt-5 space-y-2">
        <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
          {props?.title}
        </h3>
        <p className="">
          {props?.alternative.question + " "}
          <a
            href={props?.alternative.href}
            className="font-medium text-accent-100 hover:text-principal-500"
          >
            {props?.alternative.message}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthHeader;
