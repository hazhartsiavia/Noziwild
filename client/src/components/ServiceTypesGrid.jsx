import React from "react";
import { Link } from "react-router-dom"; // retire cet import si tu n'utilises pas react-router

const defaultItems = [
  {
    image:
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80",
    label: "Tokyo, Japan",
    href: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&q=80",
    label: "Santorini, Greece",
    href: "#",
  },
  {
    image:
      "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80",
    label: "Sydney, Australia",
    href: "#",
  },
];

export default function ServiceTypesGrid({
  eyebrow,
  title,
  items = defaultItems,
  columns = 3,
  bgColor = "#F3E9EC",
  cardBg = "#FFFFFF",
  textColor = "#1F2A44",
  gap = "gap-6",
  aspectRatio = "aspect-[4/3]",
}) {
  const colsClass =
    {
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-2 lg:grid-cols-3",
      4: "sm:grid-cols-2 lg:grid-cols-4",
    }[columns] || "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <>
    <div className="h-10 bg-white w-full rounded-b-4xl absolute"/>
    <section
      className="w-full px-6 py-5 my-5 sm:px-10 lg:px-16 bg-[#D5E8E2]"
    > 
      <div className="mx-auto max-w-7xl">
        {(eyebrow || title) && (
          <div className="my-5 md:my-10 text-start">
            {eyebrow && (
              <p
                className="text-xs font-semibold tracking-[0.2em] sm:text-sm"
                style={{ color: `${textColor}99` }}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className="mt-4 text-3xl font-bold sm:text-4xl"
                style={{ color: textColor }}
              >
                {title}
              </h2>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 ${colsClass} ${gap}`}>
          {items.map((item, i) => {
            const CardTag = item.href ? Link : "div";
            const cardProps = item.href ? { to: item.href } : {};

            return (
              <CardTag
                key={item.label + i}
                {...cardProps}
                className="group overflow-hidden rounded-2xl shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
                style={{ backgroundColor: cardBg }}
              >
                <div className={`overflow-hidden ${aspectRatio}`}>
                  <img
                    src={item.image}
                    alt={item.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-5 py-5 text-center">
                  <p
                    className="text-lg font-semibold sm:text-xl"
                    style={{ color: textColor }}
                  >
                    {item.label}
                  </p>
                </div>
              </CardTag>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
}