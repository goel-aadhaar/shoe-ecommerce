'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import ProductCarousel from '../ui/product-carousel';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const NewArrivalSection = () => {
    const [activeCategory, setActiveCategory] = useState('shoes');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchShoes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                '/api/v1/products/filter/attribute',
                {
                    params: { attribute: 'newArrival', limit: 16 },
                    timeout: 10000,
                },
            );

            setData(response?.data?.data || []);
        } catch (e: any) {
            // eslint-disable-next-line no-console
            console.error('Error fetching new arrivals:', e);
            setError(
                e?.response?.data?.message || 'Failed to load new arrivals',
            );
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchShoes();
    }, [fetchShoes]);

    const filteredData = data.filter(
        (item) =>
            item?.category?.name === activeCategory ||
            (activeCategory === 'shoes' && item?.category?.name !== 'clogs'),
    );

    if (error) {
        return (
            <section className="w-full bg-gray-50 py-12">
                <div className="container mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-8 text-center">
                        New Arrivals
                    </h2>
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={fetchShoes}>Try Again</Button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full bg-gray-50 py-12">
            <div className="container mx-auto px-6">
                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">
                            New Arrivals
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Fresh styles just dropped. Be the first to shop our
                            latest collection
                        </p>
                    </div>

                    <Tabs
                        value={activeCategory}
                        onValueChange={setActiveCategory}
                        className="w-full"
                    >
                        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                            <TabsTrigger value="shoes">Shoes</TabsTrigger>
                            <TabsTrigger value="clogs">Clogs</TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value={activeCategory}
                            className="mt-8"
                        >
                            <ProductCarousel
                                products={filteredData}
                                loading={loading}
                                title=""
                                slidesPerView={4}
                            />
                        </TabsContent>
                    </Tabs>

                    <Separator />

                    <div className="text-center">
                        <Button variant="outline" size="lg">
                            View All New Arrivals
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewArrivalSection;

