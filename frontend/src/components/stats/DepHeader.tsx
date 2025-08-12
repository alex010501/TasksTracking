import { useEffect, useState } from "react";
import { getDepartmentName } from "../../api"; // путь скорректируй при необходимости

export default function DepartmentHeader() {
  const [name, setName] = useState("...");

  useEffect(() => {
    getDepartmentName()
      .then((data) => setName(data.department_name))
      .catch((err) => {
        console.error("Ошибка загрузки названия отдела:", err);
        setName("Ошибка загрузки");
      });
  }, []);

  return <>{name}</>;
}