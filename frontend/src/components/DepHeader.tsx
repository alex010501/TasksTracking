import { useEffect, useState } from "react"

export default function DepartmentHeader() {
  const [name, setName] = useState("...")

  useEffect(() => {
    fetch("http://127.0.0.1:8080/stats/department_name")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Ошибка запроса")
        }
        return res.json()
      })
      .then((data) => setName(data.name))
      .catch((err) => {
        console.error("Ошибка загрузки названия отдела:", err)
        setName("Ошибка загрузки")
      })
  }, [])

  return <>{name}</>
}
