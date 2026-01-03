"use client";

import React from "react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cx(
        "rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur",
        props.className
      )}
    />
  );
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("p-5 pb-2", props.className)} />;
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 {...props} className={cx("text-2xl font-semibold tracking-tight", props.className)} />;
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("p-5 pt-3", props.className)} />;
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = size === "lg" ? "px-4 py-3 text-[18px]" : "px-3 py-2 text-[16px]";
  const styles =
    variant === "primary"
      ? "bg-white text-neutral-950 hover:bg-white/90"
      : variant === "danger"
      ? "bg-red-500 text-white hover:bg-red-400"
      : "bg-white/0 text-white hover:bg-white/10 border border-white/10";
  return <button className={cx(base, sizes, styles, className)} {...rest} />;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={cx(
        "w-full rounded-xl border border-white/10 bg-neutral-950/40 px-4 py-3 text-[18px] outline-none",
        "placeholder:text-white/40 focus:border-white/20 focus:ring-2 focus:ring-white/10",
        className
      )}
    />
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <textarea
      {...rest}
      className={cx(
        "w-full min-h-[120px] rounded-xl border border-white/10 bg-neutral-950/40 px-4 py-3 text-[18px] outline-none",
        "placeholder:text-white/40 focus:border-white/20 focus:ring-2 focus:ring-white/10",
        className
      )}
    />
  );
}

export function Badge({ className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...rest}
      className={cx(
        "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[14px] text-white/80",
        className
      )}
    />
  );
}
