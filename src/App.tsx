import { RegisterForm } from "./components/RegisterForm";
import { Container, Title } from "@mantine/core";

export default function App() {
  return (
    <Container py="xl">
      <Title order={2} ta="center" mb="xl">
        Register
      </Title>
      <RegisterForm />
    </Container>
  );
}
