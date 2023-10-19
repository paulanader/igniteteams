import { Container, Subtitle, Title } from "./style";

type Props = {
  title: string;
  subtitle: string;
};

export function HighLight({ title, subtitle }: Props) {
  return (
    <Container>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Container>
  );
}
