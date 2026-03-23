"use client";

import { Component } from "react";
import { Button } from "./Button";
import { reportFrontendError } from "@/lib/monitoring";

class SectionErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportFrontendError(error, {
      source: this.props.source || "section-error-boundary",
      componentStack: info?.componentStack
    });
  }

  componentDidUpdate(prevProps) {
    const previousKeys = JSON.stringify(prevProps.resetKeys || []);
    const nextKeys = JSON.stringify(this.props.resetKeys || []);

    if (this.state.hasError && previousKeys !== nextKeys) {
      this.setState({ hasError: false });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    const {
      children,
      title = "No pudimos cargar esta seccion",
      description = "Puedes intentarlo de nuevo sin salir de la pagina."
    } = this.props;

    if (this.state.hasError) {
      return (
        <div className="surface space-y-4 p-6 text-center">
          <div className="eyebrow">Monitoreo activo</div>
          <h3 className="font-serif text-2xl font-semibold text-ink">{title}</h3>
          <p className="text-sm leading-7 text-ink/65">{description}</p>
          <div className="flex justify-center">
            <Button onClick={this.handleRetry}>Reintentar</Button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export function SectionErrorBoundary(props) {
  return <SectionErrorBoundaryInner {...props} />;
}
