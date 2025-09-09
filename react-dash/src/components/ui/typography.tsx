interface TypographyProps {
  version: "h1" | "h2" | "h3" | "h4" | "p";
  children?: React.ReactNode;
}

export function Typography({ version, children }: TypographyProps) {
  if (version === "h1")
    return (
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {children}
      </h1>
    );
  else if (version === "h2")
    return (
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        {children}
      </h2>
    );
  else if (version === "h3")
    return (
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {children}
      </h3>
    );
  else if (version === "h4")
    return (
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {children}
      </h4>
    );
  else
    return <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>;

  return null;
}
