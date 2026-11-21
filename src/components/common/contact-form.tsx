"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)"),
});
type Values = z.infer<typeof schema>;

export function ContactForm({ className, idPrefix = "" }: { className?: string; idPrefix?: string }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  return (
    <form
      noValidate
      onSubmit={handleSubmit(() => { toast.success("Message sent (design preview)"); reset(); })}
      className={cn("space-y-4 rounded-2xl border bg-card p-6", className)}
    >
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}name`}>Name</Label>
        <Input id={`${idPrefix}name`} {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && <p role="alert" className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}email`}>Email</Label>
        <Input id={`${idPrefix}email`} type="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p role="alert" className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}message`}>Message</Label>
        <Textarea id={`${idPrefix}message`} rows={5} {...register("message")} aria-invalid={!!errors.message} />
        {errors.message && <p role="alert" className="text-xs text-destructive">{errors.message.message}</p>}
      </div>
      <Button type="submit" size="lg">Send message</Button>
    </form>
  );
}
