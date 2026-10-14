export interface CV {
  basics: Basics
  work: Array<Work>
  education: Array<Education>
  certificates: Array<Certificate>
  skills: Array<SkillGroup>
  languages: Array<Language>
  projects: Array<Project>
}

export interface Basics {
  name: string
  label: string
  headline: string
  image: string
  email: string
  url: string
  summary: string
  location: Location
  profiles: Array<Profile>
  metrics: Array<Metric>
  stack: Array<string>
}

export interface Location {
  city: string
  region: string
  countryCode: string
}

export interface Profile {
  network: string
  username: string
  url: string
}

export interface Metric {
  value: number
  prefix?: string
  suffix?: string
  label: string
  detail: string
}

export interface Work {
  name: string
  position: string
  location: string
  url: string
  startDate: string
  endDate: string | null
  summary: string
  highlights: Array<string>
  groups?: Array<WorkGroup>
}

export interface WorkGroup {
  title: string
  highlights: Array<string>
}

export interface Education {
  institution: string
  url: string
  area: string
  studyType: string
  startDate: string
  endDate: string
  summary?: string
}

export interface Certificate {
  name: string
  issuer: string
  date: string
}

export interface SkillGroup {
  name: string
  keywords: Array<string>
}

export interface Language {
  language: string
  fluency: string
}

export interface Project {
  name: string
  isActive: boolean
  description: string
  highlights: Array<string>
  url: string
  github?: string
}
