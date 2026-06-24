import { useForm } from "@tanstack/react-form";
import { TextInput, Button, Box, Text } from "@mantine/core";
import { loginWithCode } from "../utils/auth";
import { useEffect, useRef, useState } from "react";

type LoginFormProps = {
	initialCode?: string;
};

export function LoginForm({ initialCode }: LoginFormProps) {
	const [error, setError] = useState<string | null>(null);
	const autoLoginAttempted = useRef(false);

	const form = useForm({
		defaultValues: {
			loginCode: initialCode?.toUpperCase() ?? "",
		},
		onSubmit: async ({ value }) => {
			setError(null);

			try {
				await loginWithCode(value.loginCode);
			} catch (err: any) {
				setError(err.message || "Invalid login code");
			}
		},
	});

	useEffect(() => {
		if (!initialCode || autoLoginAttempted.current) return;

		const code = initialCode.toUpperCase();
		form.setFieldValue("loginCode", code);

		if (code.length !== 8) return;

		autoLoginAttempted.current = true;
		setError(null);

		loginWithCode(code).catch((err: { message?: string }) => {
			setError(err.message || "Invalid login code");
		});
	}, [initialCode, form]);

	return (
		<Box maw={400} mx="auto" mt="xl">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<form.Field
					name="loginCode"
					validators={{
						onChange: ({ value }) => {
							if (!value) return "Login code is required";
							if (value.length !== 8) return "Login code must be 8 characters";
							return undefined;
						},
					}}
					children={(field) => (
						<TextInput
							label="Login Code"
							size="lg"
							placeholder="Enter your 8-character code"
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
							onBlur={field.handleBlur}
							error={
								field.state.meta.errors.length
									? field.state.meta.errors.join(", ")
									: undefined
							}
							mb="sm"
						/>
					)}
				/>

				{error && (
					<Text c="red" size="sm" mb="sm">
						{error}
					</Text>
				)}

				<Button size="md" type="submit" mt="md" fullWidth>
					Login
				</Button>
			</form>
		</Box>
	);
}
