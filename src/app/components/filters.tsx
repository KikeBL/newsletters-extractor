import { Button } from "@nextui-org/button";
import { useSearchParams } from "next/navigation";

export default function Filters() {
  const searchParams = useSearchParams();
  const search = searchParams.get("filter");

  return (
    <div className="flex gap-4 items-start justify-start">
      <a href="?filter=all">
        <Button color="primary" variant={search === "all" ? "solid" : "ghost"}>
          All
        </Button>
      </a>
      <a href="?filter=andalucia">
        <Button
          color="success"
          variant={search === "andalucia" ? "solid" : "ghost"}
        >
          Andalucía
        </Button>
      </a>
      <a href="?filter=huelva">
        <Button
          color={search === "huelva" ? "primary" : "default"}
          variant={search === "huelva" ? "solid" : "ghost"}
        >
          Huelva
        </Button>
      </a>
      <a href="?filter=sevilla">
        <Button
          color={search === "sevilla" ? "primary" : "default"}
          variant={search === "sevilla" ? "solid" : "ghost"}
        >
          Sevilla
        </Button>
      </a>
      <a href="?filter=cadiz">
        <Button
          color={search === "cadiz" ? "primary" : "default"}
          variant={search === "cadiz" ? "solid" : "ghost"}
        >
          Cádiz
        </Button>
      </a>
      <a href="?filter=cordoba">
        <Button
          color={search === "cordoba" ? "primary" : "default"}
          variant={search === "cordoba" ? "solid" : "ghost"}
        >
          Córdoba
        </Button>
      </a>
      <a href="?filter=granada">
        <Button
          color={search === "granada" ? "primary" : "default"}
          variant={search === "granada" ? "solid" : "ghost"}
        >
          Granada
        </Button>
      </a>
      <a href="?filter=malaga">
        <Button
          color={search === "malaga" ? "primary" : "default"}
          variant={search === "malaga" ? "solid" : "ghost"}
        >
          Málaga
        </Button>
      </a>
      <a href="?filter=jaen">
        <Button
          color={search === "jaen" ? "primary" : "default"}
          variant={search === "jaen" ? "solid" : "ghost"}
        >
          Jaén
        </Button>
      </a>
      <a href="?filter=almeria">
        <Button
          color={search === "almeria" ? "primary" : "default"}
          variant={search === "almeria" ? "solid" : "ghost"}
        >
          Almería
        </Button>
      </a>
    </div>
  );
}
// Function removed as it was not used

