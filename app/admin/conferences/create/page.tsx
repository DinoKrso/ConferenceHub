"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Check, ImageIcon, Info, MapPin, Upload, Users, X } from "lucide-react"
import Link from "next/link"

export default function CreateConferencePage() {
  const [activeTab, setActiveTab] = useState("basic")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert("Conference created successfully!")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Conference</h1>
          <p className="text-muted-foreground">Add a new conference to the platform</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conference Creation</CardTitle>
              <CardDescription>Complete all sections to create your conference</CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col space-y-1">
                <Button
                  variant={activeTab === "basic" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("basic")}
                >
                  <Info className="mr-2 h-4 w-4" />
                  Basic Information
                </Button>
                <Button
                  variant={activeTab === "details" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("details")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Date & Location
                </Button>
                <Button
                  variant={activeTab === "media" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("media")}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Media & Branding
                </Button>
                <Button
                  variant={activeTab === "tickets" ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setActiveTab("tickets")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Tickets & Registration
                </Button>
              </nav>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completion Status</CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Basic Information</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="text-xs">2</span>
                  </div>
                  <span className="text-sm">Date & Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="text-xs">3</span>
                  </div>
                  <span className="text-sm">Media & Branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <span className="text-xs">4</span>
                  </div>
                  <span className="text-sm">Tickets & Registration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Create Your Conference</CardTitle>
                <CardDescription>Fill out the details below to create a new conference</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="hidden">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="details">Date & Location</TabsTrigger>
                    <TabsTrigger value="media">Media & Branding</TabsTrigger>
                    <TabsTrigger value="tickets">Tickets & Registration</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Conference Name</Label>
                      <Input id="name" placeholder="Enter conference name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select defaultValue="it">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="it">IT</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="data">Data Science</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter conference description"
                        className="min-h-32"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL (Optional)</Label>
                      <Input id="website" placeholder="https://yourconference.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hashtags">Hashtags</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          id="hashtags"
                          placeholder="Add hashtags separated by commas (e.g., tech,ai,innovation)"
                        />
                        <div className="flex flex-wrap gap-1">
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                            #tech <X className="ml-1 h-3 w-3 cursor-pointer" />
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                            #ai <X className="ml-1 h-3 w-3 cursor-pointer" />
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                            #innovation <X className="ml-1 h-3 w-3 cursor-pointer" />
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Add relevant hashtags to help attendees find your conference. Popular hashtags: #tech, #ai,
                          #webdev, #security
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setActiveTab("details")}>
                        Next: Date & Location
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <DatePicker />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <DatePicker />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Input id="location" placeholder="Enter venue name" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="Street address" required />
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="City" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input id="state" placeholder="State/Province" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">Zip/Postal Code</Label>
                        <Input id="zip" placeholder="Zip/Postal Code" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select defaultValue="us">
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="de">Germany</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                        Previous
                      </Button>
                      <Button type="button" onClick={() => setActiveTab("media")}>
                        Next: Media & Branding
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="space-y-6">
                    <div className="space-y-2">
                      <Label>Conference Banner</Label>
                      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed p-12">
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Drag & drop your banner image</p>
                            <p className="text-xs text-muted-foreground">
                              Recommended size: 1200 x 600 pixels (16:9 ratio)
                            </p>
                          </div>
                          <Button type="button" variant="outline" size="sm">
                            Browse Files
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Conference Logo (Optional)</Label>
                      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-12">
                        <div className="flex flex-col items-center justify-center space-y-2 text-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Upload your logo</p>
                            <p className="text-xs text-muted-foreground">Recommended size: 400 x 400 pixels</p>
                          </div>
                          <Button type="button" variant="outline" size="sm">
                            Browse Files
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Brand Color (Optional)</Label>
                      <div className="flex gap-2">
                        <Input id="color" type="color" defaultValue="#7c3aed" className="h-10 w-20 p-1" />
                        <Input
                          id="colorHex"
                          defaultValue="#7c3aed"
                          className="flex-1"
                          placeholder="Enter hex color code"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                        Previous
                      </Button>
                      <Button type="button" onClick={() => setActiveTab("tickets")}>
                        Next: Tickets & Registration
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="tickets" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Maximum Capacity</Label>
                      <Input id="capacity" type="number" placeholder="Enter maximum number of attendees" min="1" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ticket Types</Label>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="rounded-lg border p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="font-medium">Early Bird Ticket</h4>
                                <Badge>Active</Badge>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <Label htmlFor="earlyBirdPrice">Price</Label>
                                  <Input id="earlyBirdPrice" placeholder="$299" />
                                </div>
                                <div>
                                  <Label htmlFor="earlyBirdQuantity">Quantity</Label>
                                  <Input id="earlyBirdQuantity" placeholder="100" type="number" min="1" />
                                </div>
                              </div>
                            </div>
                            <div className="rounded-lg border p-4">
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="font-medium">Regular Ticket</h4>
                                <Badge>Active</Badge>
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <Label htmlFor="regularPrice">Price</Label>
                                  <Input id="regularPrice" placeholder="$399" />
                                </div>
                                <div>
                                  <Label htmlFor="regularQuantity">Quantity</Label>
                                  <Input id="regularQuantity" placeholder="200" type="number" min="1" />
                                </div>
                              </div>
                            </div>
                            <Button type="button" variant="outline" className="w-full">
                              Add Ticket Type
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationStart">Registration Start Date</Label>
                      <DatePicker />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationEnd">Registration End Date</Label>
                      <DatePicker />
                    </div>
                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={() => setActiveTab("media")}>
                        Previous
                      </Button>
                      <Button type="submit">Create Conference</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
