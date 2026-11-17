import React, { Suspense } from "react";
import { RegisterWizard } from "@/components/auth/RegisterWizard";

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-espresso/70">
          Cargando registro...
        </div>
      }
    >
      <RegisterWizard />
    </Suspense>
  );
}
