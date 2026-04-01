'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import ProductCarousel from '../ui/product-carousel';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const TrendingSection = () => {
    const [active, setActive] = useState<'Male' | 'Female'>('Male');
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
                    params: { attribute: 'trending', limit: 14 },
                    timeout: 10000,
                },
            );

            setData(response?.data?.data || []);
        } catch (e: any) {
            // eslint-disable-next-line no-console
            console.error('Error fetching trending shoes:', e);
            setError(
                e?.response?.data?.message ||
                    'Failed to load trending products',
            );
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchShoes();
    }, [fetchShoes]);

    const filteredData = data.filter((item) => item?.for === active);

    if (error) {
        return (
            <section className="w-full bg-white py-12">
                <div className="container mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-8 text-center">
                        Trending Now
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
        <section className="w-full bg-white py-12">
            <div className="container mx-auto px-6">
                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Trending Now
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Discover the hottest styles that everyone&apos;s
                            talking about
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="inline-flex rounded-lg border p-1 bg-gray-100">
                            <Button
                                variant={active === 'Male' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setActive('Male')}
                                className="rounded-md"
                            >
                                Men
                            </Button>
                            <Button
                                variant={
                                    active === 'Female' ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => setActive('Female')}
                                className="rounded-md"
                            >
                                Women
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <ProductCarousel
                        products={filteredData}
                        loading={loading}
                        title=""
                        slidesPerView={4}
                    />
                </div>
            </div>
        </section>
    );
};

export default TrendingSection;

