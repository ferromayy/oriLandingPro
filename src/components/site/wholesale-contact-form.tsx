"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

const inputClass =
  "h-11 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 transition-all duration-300 group-hover:border-gray-400 group-hover:bg-gray-100 focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

const labelClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-900 transition-colors duration-300";

export function WholesaleContactForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = encodeURIComponent(
      [
        "Solicitud Mayoristas — Orí Cafe",
        "",
        `Nombre: ${name}`,
        `Empresa: ${company}`,
        `Email: ${email}`,
        `Teléfono: ${phone}`,
        "",
        message,
      ].join("\n"),
    );

    window.open(`https://wa.me/543513053755?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div
      id="contact-form"
      className="group mx-auto max-w-5xl cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-stone-50 hover:shadow-md"
    >
      <div className="flex flex-col md:flex-row">
        <div className="flex w-full flex-col gap-10 p-8 md:w-3/5 md:p-16">
          <div>
            <h2 className="mb-2 text-2xl font-medium tracking-tight text-gray-900 transition-colors duration-300">
              Comienza a trabajar con nosotros
            </h2>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Nombre completo</span>
                <input
                  className={inputClass}
                  placeholder="Juan Pérez"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Empresa</span>
                <input
                  className={inputClass}
                  placeholder="Café del Centro"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Email</span>
                <input
                  className={inputClass}
                  placeholder="contacto@tuempresa.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Teléfono</span>
                <input
                  className={inputClass}
                  placeholder="+54 11 ..."
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className={labelClass}>¿Cómo podemos ayudarte?</span>
              <textarea
                className={`${inputClass} min-h-[120px] resize-y py-3`}
                placeholder="Cuéntanos sobre tu negocio..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </label>

            <button
              className="mt-4 h-11 w-full self-start rounded bg-gray-900 px-8 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-black hover:shadow-lg sm:w-auto"
              type="submit"
            >
              Enviar Solicitud
            </button>
          </form>
        </div>

        <div className="relative w-full overflow-hidden border-l border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 group-hover:border-gray-300 group-hover:bg-gray-200 md:w-2/5">
          <div className="absolute inset-0">
            <Image
              src="/images/about/wholesaleImage.jpg"
              alt="Mayoristas"
              fill
              className="object-cover opacity-20 transition-opacity duration-300 group-hover:opacity-30"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-16">
            <div>
              <h3 className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-gray-600 transition-colors duration-300">
                Contacto Directo
              </h3>
              <ul className="flex flex-col gap-8">
                <li className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-gray-600 transition-colors duration-300">
                    Ventas Mayoristas
                  </p>
                  <a
                    className="text-lg font-medium text-gray-900 transition-colors hover:text-gray-900"
                    href="mailto:oritostadores@gmail.com"
                  >
                    oritostadores@gmail.com
                  </a>
                </li>
                <li className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-wide text-gray-600 transition-colors duration-300">
                    Teléfono
                  </p>
                  <a
                    className="text-lg font-medium text-gray-900 transition-colors hover:text-gray-900"
                    href="tel:+543513053755"
                  >
                    +54 351 305-3755
                  </a>
                </li>
              </ul>
            </div>

            <div className="mt-12">
              <p className="text-sm italic text-gray-600 transition-colors duration-300">
                &ldquo;El secreto de un gran negocio empieza con un gran café.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
