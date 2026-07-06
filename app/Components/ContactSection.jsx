"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  ALL CONTENT LIVES HERE — edit this JSON block to change the page   */
/* ------------------------------------------------------------------ */
const CONTACT_DATA = {
  "form": {
    "heading": "Send Us A Message",
    "subheading": "Fill out the form below and our team will get back to you as soon as possible.",
    "submitUrl": "/api/contact",
    "submitLabel": "Send Message",
    "services": [
      "General Inquiry",
      "Home Automation",
      "Office Automation",
      "Security Systems",
      "Maintenance & Support",
      "Other"
    ],
    "rows": [
      ["name", "phone"],
      ["email", "service"],
      ["subject"],
      ["message"]
    ],
    "fields": {
      "name": {
        "type": "text",
        "placeholder": "Your Name",
        "required": true,
        "errorMessage": "Please enter your name."
      },
      "phone": {
        "type": "tel",
        "placeholder": "Phone Number",
        "required": true,
        "pattern": "^[0-9+\\-\\s()]{7,15}$",
        "errorMessage": "Please enter a valid phone number."
      },
      "email": {
        "type": "email",
        "placeholder": "Email Address",
        "required": true,
        "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        "errorMessage": "Please enter a valid email address."
      },
      "service": {
        "type": "select",
        "placeholder": "Select Service",
        "required": true,
        "errorMessage": "Please select a service."
      },
      "subject": {
        "type": "text",
        "placeholder": "Subject",
        "required": true,
        "errorMessage": "Please enter a subject."
      },
      "message": {
        "type": "textarea",
        "placeholder": "Your Message",
        "required": true,
        "errorMessage": "Please enter your message."
      }
    }
  },
  "info": {
    "heading": "Contact Information",
    "items": [
      {
        "id": "location",
        "icon": "MapPin",
        "iconColor": "text-red-500",
        "bg": "bg-red-50",
        "title": "Our Location",
        "lines": [
          "Sanwer Bypass, Near Indore Dewas Toll,",
          "Indore, Madhya Pradesh - 453775"
        ],
        "link": null
      },
      {
        "id": "phone",
        "icon": "Phone",
        "iconColor": "text-red-500",
        "bg": "bg-red-50",
        "title": "Phone Number",
        "lines": ["+91-7489174850"],
        "link": "tel:+917489174850"
      },
      {
        "id": "whatsapp",
        "icon": "MessageCircle",
        "iconColor": "text-green-500",
        "bg": "bg-green-50",
        "title": "WhatsApp",
        "lines": ["+91-7489174850"],
        "link": "https://wa.me/917489174850"
      },
      {
        "id": "email",
        "icon": "Mail",
        "iconColor": "text-red-500",
        "bg": "bg-red-50",
        "title": "Email Address",
        "lines": ["aoneautomation125@gmail.com"],
        "link": "mailto:aoneautomation125@gmail.com"
      },
      {
        "id": "hours",
        "icon": "Clock",
        "iconColor": "text-red-500",
        "bg": "bg-red-50",
        "title": "Working Hours",
        "lines": [
          "Mon - Sat: 9:00 AM - 7:00 PM",
          "Sunday: Emergency Support Only"
        ],
        "link": null
      }
    ]
  }
};
/* ------------------------------------------------------------------ */

const ICONS = { MapPin, Phone, MessageCircle, Mail, Clock };

function buildInitialForm(fields) {
  return Object.keys(fields).reduce((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});
}

export default function ContactSection() {
  const { form: formData, info: infoData } = CONTACT_DATA;
  const [form, setForm] = useState(() => buildInitialForm(formData.fields));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate() {
    const next = {};
    Object.entries(formData.fields).forEach(([key, config]) => {
      const value = (form[key] || "").trim();
      if (config.required && !value) {
        next[key] = config.errorMessage;
        return;
      }
      if (config.pattern && value && !new RegExp(config.pattern).test(value)) {
        next[key] = config.errorMessage;
      }
    });
    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch(formData.submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setForm(buildInitialForm(formData.fields));
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  function renderField(key) {
    const config = formData.fields[key];
    const hasError = Boolean(errors[key]);
    const baseClasses = `w-full rounded-lg border px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
      hasError ? "border-red-400" : "border-gray-200"
    }`;

    let control;

    if (config.type === "textarea") {
      control = (
        <textarea
          name={key}
          placeholder={config.placeholder}
          rows={6}
          value={form[key]}
          onChange={handleChange}
          aria-invalid={hasError}
          className={`${baseClasses} resize-y`}
        />
      );
    } else if (config.type === "select") {
      control = (
        <select
          name={key}
          value={form[key]}
          onChange={handleChange}
          aria-invalid={hasError}
          className={`${baseClasses} appearance-none bg-white ${
            form[key] ? "text-gray-700" : "text-gray-400"
          }`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            backgroundSize: "1.1rem",
          }}
        >
          <option value="" disabled>
            {config.placeholder}
          </option>
          {formData.services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      );
    } else {
      control = (
        <input
          type={config.type}
          name={key}
          placeholder={config.placeholder}
          value={form[key]}
          onChange={handleChange}
          aria-invalid={hasError}
          className={baseClasses}
        />
      );
    }

    return (
      <div key={key}>
        {control}
        {hasError && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <section className="w-full bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-6">
        {/* Left: Form Card */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:w-[65%]">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {formData.heading}
          </h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            {formData.subheading}
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {formData.rows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-1 gap-4 ${
                  row.length > 1 ? "sm:grid-cols-2" : ""
                }`}
              >
                {row.map((key) => renderField(key))}
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {formData.submitLabel}
                  </>
                )}
              </button>

              {status === "success" && (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Message sent successfully!
                </span>
              )}

              {status === "error" && (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Something went wrong. Please try again.
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Right: Contact Info Card */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:w-[35%]">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {infoData.heading}
          </h2>

          <div className="mt-6 divide-y divide-gray-100">
            {infoData.items.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <div key={item.id} className="flex items-start gap-4 py-5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      {item.link ? (
                        <a
                          href={item.link}
                          target={
                            item.link.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            item.link.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="hover:underline"
                        >
                          {item.lines.join(" ")}
                        </a>
                      ) : (
                        item.lines.map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < item.lines.length - 1 && <br />}
                          </span>
                        ))
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}