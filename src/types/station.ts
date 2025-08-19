export interface Station {
  id: string
  name: string
  location: string
  status: "active" | "inactive" | "maintenance"
  latitude: number
  longitude: number
  type: string
  lastReading: string
  currentTemperature: number | string
}
