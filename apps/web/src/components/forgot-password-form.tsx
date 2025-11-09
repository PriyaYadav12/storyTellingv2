import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { BookOpen } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordForm() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [stage, setStage] = useState<"request" | "reset">("request");

	const requestForm = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.forgetPassword.emailOtp(
				{
					email: value.email,
				},
				{
					onSuccess: () => {
						setEmail(value.email);
						setStage("reset");
						toast.success("OTP sent to your email.");
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
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

	const resetForm = useForm({
		defaultValues: {
			otp: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.emailOtp.resetPassword(
				{
					email,
					otp: value.otp,
					password: value.password,
				},
				{
					onSuccess: () => {
						toast.success("Password reset successfully. Please sign in.");
						navigate({ to: "/dashboard", replace: true });
					},
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				otp: z
					.string()
					.min(6, "OTP must be at least 6 characters")
					.max(10, "OTP too long"),
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl border border-purple-100 dark:border-purple-900 shadow-2xl p-8 space-y-6">
					<div className="flex justify-center mb-4">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
							<BookOpen className="h-8 w-8 text-white" />
						</div>
					</div>

					<h1 className="text-center text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
						Forgot Password
					</h1>
					<p className="text-center text-muted-foreground">
						{stage === "request"
							? "Enter your email to receive an OTP."
							: "Enter the OTP sent to your email and your new password."}
					</p>

					{stage === "request" ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								requestForm.handleSubmit();
							}}
							className="space-y-4"
						>
							<div>
								<requestForm.Field name="email">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Email</Label>
											<Input
												id={field.name}
												name={field.name}
												type="email"
												placeholder="your@email.com"
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
								</requestForm.Field>
							</div>
							<requestForm.Subscribe>
								{(state) => (
									<Button
										type="submit"
										className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
										disabled={!state.canSubmit || state.isSubmitting}
									>
										{state.isSubmitting ? "Sending OTP..." : "Send OTP"}
									</Button>
								)}
							</requestForm.Subscribe>
						</form>
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								resetForm.handleSubmit();
							}}
							className="space-y-4"
						>
							<div>
								<Label>Email</Label>
								<Input value={email} readOnly className="rounded-xl" />
							</div>
							<div>
								<resetForm.Field name="otp">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>OTP</Label>
											<Input
												id={field.name}
												name={field.name}
												placeholder="Enter OTP"
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
								</resetForm.Field>
							</div>
							<div>
								<resetForm.Field name="password">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>New Password</Label>
											<Input
												id={field.name}
												name={field.name}
												type="password"
												placeholder="••••••••"
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
								</resetForm.Field>
							</div>
							<resetForm.Subscribe>
								{(state) => (
									<Button
										type="submit"
										className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
										disabled={!state.canSubmit || state.isSubmitting}
									>
										{state.isSubmitting ? "Resetting..." : "Reset Password"}
									</Button>
								)}
							</resetForm.Subscribe>
						</form>
					)}

					<div className="text-center">
						<Button
							variant="link"
							onClick={() => navigate({ to: "/dashboard" })}
							className="text-purple-600 hover:text-purple-800"
						>
							Back to Sign In
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}


