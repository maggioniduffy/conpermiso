"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  reset() {
    this.setState({ hasError: false, message: "" });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
          <div className="bg-red-50 rounded-full p-4">
            <AlertTriangle className="size-8 text-red-400" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-jet text-sm">Algo salió mal</p>
            <p className="text-xs text-jet-700 max-w-xs">
              Ocurrió un error inesperado. Podés intentar recargar la sección.
            </p>
          </div>
          <Button
            onClick={() => this.reset()}
            variant="outline"
            className="gap-2 rounded-xl text-sm border-principal/30 text-principal hover:bg-principal/5"
          >
            <RefreshCw className="size-3.5" />
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
