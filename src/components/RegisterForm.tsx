import { useForm } from "@tanstack/react-form";
import { TextInput, Button, Box, Text } from "@mantine/core";
import { registerWithNickname } from "../utils/auth";
import { useState } from "react";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loginCode, setLoginCode] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nickname: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(false);
      setLoginCode(null);

      try {
        const result = await registerWithNickname(value.nickname);
        setSuccess(true);
        setLoginCode(result.loginCode);
        form.reset();
      } catch (err: any) {
        if (err.code === "23505") {
          setError("Nickname is already taken");
        } else {
          setError(err.message || "An unexpected error occurred");
        }
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
          name="nickname"
          validators={{
            onChange: ({ value }) => {
              if (!value) return "Nickname is required";
              if (value.length > 15) return "Maximum 15 characters allowed";
              if (/\s/.test(value)) return "Spaces are not allowed";
              return undefined;
            },
          }}
          children={(field) => (
            <TextInput
              label="Nickname"
              placeholder="Enter a unique nickname"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
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
        {success && (
          <Box mb="sm">
            <Text c="green" size="sm" fw={500}>
              Successfully registered!
            </Text>
            {loginCode && (
              <Text size="sm" mt="xs">
                Your login code is:{" "}
                <Text span fw={700} c="blue">
                  {loginCode}
                </Text>
                . Please save it, you will need it to login!
              </Text>
            )}
          </Box>
        )}

        <Button type="submit" mt="md" fullWidth>
          Register
        </Button>
      </form>
    </Box>
  );
}
