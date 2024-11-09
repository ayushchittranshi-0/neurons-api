import { useState, useEffect } from 'react'
import { API_URL } from './config'

export function useTrainData() {

    const [trains, setTrains] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [seeding, setSeeding] = useState(false)

    const seedData = async () => {
        try {
            setSeeding(true)
            const response = await fetch(`${API_URL}/seed-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail?.message || 'Failed to seed data')
            }

            fetchTrains()

        } catch (err) {
            setError(`Failed to seed data: ${err.message}`)
        } finally {
            setSeeding(false)
        }
    }

    const fetchTrains = async () => {
        console.log("fetching train data")
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/trains-data`)
            const data = await response.json()

            console.log("train data", data)
            if (data?.data?.length === 0) {
                setError('NEED_SEED')
                return
            }

            if (!response.ok) {
                if (data.detail?.code === 'TABLE_NOT_FOUND') {
                    throw new Error('No trains data available in the system')
                }
                throw new Error(data.detail?.message || 'Failed to fetch trains data')
            }

            setTrains(data.data)
            setError(null)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTrains()
    }, [])
    return {
        trains,
        loading, error, seedData, seeding

    }
}
