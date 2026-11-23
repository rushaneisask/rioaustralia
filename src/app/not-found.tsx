import { site } from "@/content/site";
import { Button, Container } from "@/components/ui/primitives";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <section className="bg-caustic flex min-h-[80svh] items-center pt-28">
      <Container className="flex flex-col items-center gap-6 text-center">
        <LogoMark className="h-16 w-16" />
        <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl">{site.notFound.title}</h1>
        <p className="max-w-md text-lg text-ink-soft">{site.notFound.body}</p>
        <Button href="/">{site.notFound.cta}</Button>
      </Container>
    </section>
  );
}
