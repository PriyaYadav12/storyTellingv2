import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Shield, ArrowLeft } from "lucide-react";

export default function AdminForgotPasswordForm() {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.forgetPassword(
				{
					email: value.email,
					redirectTo: "/reset-password",
				},
				{
					onSuccess: () => {
						toast.success("Password reset link sent to your email! 📧");
						setTimeout(() => {
							navigate({ to: "/admin" });
						}, 2000);
					},
					onError: (error) => {
						toast.error(error.error.message || "Failed to send reset link");
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("Invalid email address"),
			}),
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
			<div className="w-full max-w-md">
				<div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-6">
					{/* Logo/Icon */}
					<div className="flex justify-center mb-4">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shadow-lg">
							<Shield className="h-8 w-8 text-white" />
						</div>
					</div>

					<div className="space-y-2">
						<h1 className="text-center text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
							Reset Password
						</h1>
						<p className="text-center text-muted-foreground">
							Enter your email to receive a password reset link
						</p>
					</div>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<div>
							<form.Field name="email">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Email</Label>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											placeholder="admin@example.com"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											className="rounded-xl"
										/>
										{field.state.meta.errors.map((error) => (
											<p key={error?.message} className="text-red-500 text-sm">
												{error?.message}
											</p>
										))}
									</div>
								)}
							</form.Field>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="w-full rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white shadow-lg mt-6"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? "Sending..." : "Send Reset Link"}
								</Button>
							)}
						</form.Subscribe>
					</form>

					<div className="text-center">
						<Button
							variant="link"
							onClick={() => navigate({ to: "/admin" })}
							className="text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 mx-auto"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to Sign In
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

