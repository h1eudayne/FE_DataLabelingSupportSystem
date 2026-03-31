import { render, screen } from "@testing-library/react";
import { Database } from "lucide-react";
import StatCard from "./StatCard";

describe("Manager analytics StatCard", () => {
  it("renders Lucide icons passed as component references", () => {
    const { container } = render(
      <StatCard title="Total Projects" value={12} icon={Database} color="primary" />,
    );

    expect(screen.getByText("Total Projects")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
