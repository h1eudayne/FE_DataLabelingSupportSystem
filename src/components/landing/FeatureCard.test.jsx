import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FeatureCard from "./FeatureCard";
import { Layers } from "lucide-react";
import "@testing-library/jest-dom";

describe("FeatureCard Component", () => {
  it("nên hiển thị đúng title, description và icon từ props", () => {
    const mockProps = {
      title: "Test Title",
      desc: "Test Description",
      icon: <Layers data-testid="icon-test" />,
      iconBg: "rgba(255, 0, 0, 0.1)",
      iconColor: "red",
    };

    render(<FeatureCard {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.desc)).toBeInTheDocument();

    expect(screen.getByTestId("icon-test")).toBeInTheDocument();
  });

  it("nên áp dụng đúng style background cho icon container", () => {
    const iconBg = "rgb(10, 179, 156)";
    render(
      <FeatureCard title="Title" desc="Desc" icon={<div />} iconBg={iconBg} />,
    );

    const iconContainer = screen.getByText("Title").previousSibling;
    expect(iconContainer).toHaveStyle({ backgroundColor: iconBg });
  });
});
