import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, MapPin, ChevronRight, RefreshCcw } from 'lucide-react'
import { Badge } from "./components/ui/badge";

const  TrainsData = ( ({loading, error, seeding, seedData, trains}) => {
    console.log("rerendering TrainsData")
    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                Loading trains data...
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
      <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Train Information</h2>
              <Button
                onClick={seedData}
                disabled={seeding}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {seeding ? 'Seeding Data...' : 'Refresh Train Data'}
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-12">
                <RefreshCcw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                Loading trains data...
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trains.map((train) => (
                  <TrainCard key={train.id} train={train} />
                ))}
              </div>
            )}
          </div>

    )
}
 )
export default TrainsData

const TrainCard = React.memo(({ train }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {train.train_name}
        <span className="ml-2 text-xs text-gray-500">#{train.train_no}</span>
      </CardTitle>
      <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>From: {train.starts}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>To: {train.ends}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
));
