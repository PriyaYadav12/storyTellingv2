import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { BookOpen } from "lucide-react";

interface SignInFormProps {
	onSwitchToSignUp?: () => void;
}

export default function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
	const navigate = useNavigate({
		from: "/",
	});

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
							replace: true,
						});
						toast.success("Welcome back! 🎉");
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
				password: z.string().min(8, "Password must be at least 8 characters"),
			}),
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl border border-purple-100 dark:border-purple-900 shadow-2xl p-8 space-y-6">
					{/* Logo/Icon */}
					<div className="flex justify-center mb-4">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
							<BookOpen className="h-8 w-8 text-white" />
						</div>
					</div>

					<h1 className="text-center text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
						Welcome Back!
					</h1>
					<p className="text-center text-muted-foreground">
						Sign in to continue your adventure
					</p>

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
							</form.Field>
						</div>

						<div>
							<form.Field name="password">
								{(field) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>Password</Label>
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
							</form.Field>
						</div>

						<div className="flex justify-end -mt-2">
							<Button
								type="button"
								variant="link"
								onClick={() => navigate({ to: "/forgot-password" })}
								className="text-purple-600 hover:text-purple-800 px-0"
							>
								Forgot password?
							</Button>
						</div>

						<form.Subscribe>
							{(state) => (
								<Button
									type="submit"
									className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
									disabled={!state.canSubmit || state.isSubmitting}
								>
									{state.isSubmitting ? "Signing in..." : "Sign In"}
								</Button>
							)}
						</form.Subscribe>
					</form>
					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
									Or continue with
								</span>
							</div>
						</div>
						<Button
							type="button"
							variant="outline"
							className="w-full mt-4 rounded-xl border-2 hover:border-purple-300"
							onClick={async () => {
								try {
									await authClient.signIn.social({
										provider: "google",
									});
								} catch (error: any) {
									toast.error(error?.message || "Failed to sign in with Google");
								}
							}}
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							Sign in with Google
						</Button>
					</div>
					{onSwitchToSignUp && (
						<div className="text-center text-sm">
							<span className="text-muted-foreground">Don't have an account? </span>
							<Button
								type="button"
								variant="link"
								onClick={onSwitchToSignUp}
								className="text-purple-600 hover:text-purple-800 px-0"
							>
								Sign up
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
