export function PurpleLink({ text, link, newTab = false, extraClasses }) {
  return (
    <a
      href={link}
      className={`${extraClasses || ""} hover:app-cursor-pointer hover:app-text-white app-px-4 app-py-2 app-bg-purple-900 app-text-white app-rounded hover:app-bg-purple-800 app-transition app-duration-150 app-ease-in-out`}
    >
      {text}
    </a>
  );
}
