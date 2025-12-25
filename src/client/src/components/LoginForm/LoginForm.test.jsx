import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// mock the api module used by the component
jest.mock("../../api/auth", () => ({
  loginUser: jest.fn(),
}));

import { loginUser } from "../../api/auth";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    // ensure there is a submit button
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("shows error when login fails", async () => {
    // arrange: mock loginUser to reject with a response-like object
    loginUser.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    render(<LoginForm />);

    // fill inputs
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "a@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrong" },
    });

    // click the button (target button by role + accessible name)
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // assert the error appears (wait for async update)
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Invalid credentials/i);

    // ensure loginUser was called once with proper args
    expect(loginUser).toHaveBeenCalledTimes(1);
    expect(loginUser).toHaveBeenCalledWith("a@test.com", "wrong");
  });
});
