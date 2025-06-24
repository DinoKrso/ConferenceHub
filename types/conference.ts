export interface Conference {
  _id: string
  title: string
  description: string
  category: {
    _id: string
    name: string
  }
  hashTags: string[]
  attendees: number
  startDate: string
  endDate: string
  location: string
  image: string
  ticketPrice: number
  currency: string
  maxAttendees: number
  speakersID: Array<{
    _id: string
    name: string
    surname: string
    bio: string
    profileImage: string
  }>
  createdBy: {
    _id: string
    name: string
    email: string
  }
}
