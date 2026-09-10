import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign Up | CarsAi",
  description: "Create your CarsAi account",
};

const SignUpPage = () => {
  return (
    <SignUp
      appearance={{
        variables: {
          colorPrimary: "#E4141B",
          colorText: "#1a1a1a",
          colorTextSecondary: "#6b6b6b",
          colorBackground: "transparent",
          colorInputBackground: "#ffffff",
          colorInputText: "#1a1a1a",
          borderRadius: "0.75rem",
          fontFamily: "inherit",
        },
        elements: {
          rootBox: "w-full",
          card: "shadow-none bg-transparent p-0 w-full",

          header: "mb-6",
          headerTitle: "text-2xl font-bold text-[#1a1a1a]",
          headerSubtitle: "text-sm text-[#6b6b6b]",

          socialButtonsBlockButton:
            "border border-[#e7e5e1] hover:bg-[#faf9f7] transition-colors rounded-xl h-11 text-sm font-medium",
          socialButtonsBlockButtonText: "text-[#1a1a1a] font-medium",
          dividerLine: "bg-[#e7e5e1]",
          dividerText: "text-[#9a9a9a] text-xs",

          formFieldLabel: "text-sm font-medium text-[#1a1a1a] mb-1.5",
          formFieldInput:
            "border border-[#e7e5e1] rounded-xl h-11 px-3.5 text-sm focus:border-[#E4141B] focus:ring-1 focus:ring-[#E4141B] transition-colors",
          formFieldInputShowPasswordButton:
            "text-[#6b6b6b] hover:text-[#1a1a1a]",

          formButtonPrimary:
            "bg-[#E4141B] hover:bg-[#c81017] text-sm font-semibold h-11 rounded-xl shadow-none transition-colors normal-case",

          footerActionLink: "text-[#E4141B] hover:text-[#c81017] font-medium",
          footerActionText: "text-[#6b6b6b] text-sm",
          footer: "bg-transparent",

          identityPreviewEditButton: "text-[#E4141B] hover:text-[#c81017]",
          formResendCodeLink: "text-[#E4141B] hover:text-[#c81017]",

          otpCodeFieldInput:
            "border border-[#e7e5e1] rounded-xl focus:border-[#E4141B] focus:ring-1 focus:ring-[#E4141B]",

          alertText: "text-sm",
          formFieldErrorText: "text-xs text-[#E4141B]",

          logoBox: "hidden",
        },
      }}
    />
  );
};

export default SignUpPage;
