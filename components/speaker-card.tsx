import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SpeakerCardProps {
  name: string
  surname: string
  role?: string
  image?: string
  bio?: string
  id?: string
}

export default function SpeakerCard({ name, surname, role, image, bio, id }: SpeakerCardProps) {
  const fullName = `${name} ${surname}`.trim()

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square w-full overflow-hidden">
        <img src={image || "/placeholder-profile.svg"} alt={fullName} className="h-full w-full object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-bold">{fullName}</h3>
        {role && <p className="mb-2 text-sm text-muted-foreground">{role}</p>}
        {bio && <p className="mb-4 text-sm line-clamp-3">{bio}</p>}
        {id && (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/speakers/${id}`}>View Profile</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
