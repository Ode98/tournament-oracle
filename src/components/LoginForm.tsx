import { useForm } from "@tanstack/react-form";
import { TextInput, Button, Box, Text } from "@mantine/core";
import { loginWithCode } from "../utils/auth";
import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      loginCode: "",
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

        <Button type="submit" mt="md" fullWidth>
          Login
        </Button>
      </form>
    </Box>
  );
}
