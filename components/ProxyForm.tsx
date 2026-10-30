"use client";

import type { FormEvent } from "react";
import TargetingFields from "./TargetingFields";
import {
  fieldsetClass,
  inputClass,
  labelClass,
  legendClass,
  primaryButton,
} from "./ui/styles";

type Props = { onSubmit: (form: HTMLFormElement) => void };

export default function ProxyForm({ onSubmit }: Props) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(e.currentTarget);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl bg-white p-8 shadow-lg">
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Credentials</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="proxy_user_id"
              className={labelClass}>
              Username
            </label>
            <input
              id="proxy_user_id"
              type="text"
              name="proxy_user_id"
              placeholder="Username"
              autoComplete="off"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="proxy_user_password"
              className={labelClass}>
              Password
            </label>
            <input
              id="proxy_user_password"
              type="text"
              name="proxy_user_password"
              placeholder="Password"
              autoComplete="off"
              required
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Options</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="list_count"
              className={labelClass}>
              Count
            </label>
            <input
              id="list_count"
              type="number"
              name="list_count"
              min={1}
              max={1000}
              placeholder="e.g. 10"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="list_session_type"
              className={labelClass}>
              Session type
            </label>
            <select
              id="list_session_type"
              name="list_session_type"
              defaultValue="rotating"
              className={inputClass}>
              <option value="rotating">Rotating</option>
              <option value="sticky">Sticky</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="list_format"
              className={labelClass}>
              Format
            </label>
            <select
              id="list_format"
              name="list_format"
              defaultValue="http"
              className={inputClass}>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="socks5">SOCKS5</option>
              <option value="socks5h">SOCKS5H</option>
            </select>
          </div>
        </div>
      </fieldset>

      <TargetingFields />

      <button
        type="submit"
        className={`w-full ${primaryButton}`}>
        Submit
      </button>
    </form>
  );
}
