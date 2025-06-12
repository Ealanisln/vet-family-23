import Image from 'next/image';
import { Star, Heart, Users } from 'lucide-react';

const Reviews = () => {
    return (
        <section id="testimonios" className="relative py-16 md:py-24 overflow-hidden">
            {/* Modern gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50" />
            
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(20,184,166,0.08),transparent)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(6,182,212,0.06),transparent)] pointer-events-none" />
            
            <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
                
                {/* Mobile Layout */}
                <div className="lg:hidden flex flex-col space-y-8">
                    {/* Stats badges - Mobile */}
                    <div className="flex justify-center gap-4 flex-wrap">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-full shadow-lg">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-semibold text-gray-700">5.0 ★★★★★</span>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-full shadow-lg">
                            <Users className="w-4 h-4 text-teal-600" />
                            <span className="text-sm font-semibold text-gray-700">500+ Clientes</span>
                        </div>
                    </div>

                    {/* Content - Mobile */}
                    <div className="text-center space-y-6 px-4">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-teal-700 to-cyan-700">
                                Nuestros clientes son nuestra prioridad.
                            </h1>
                            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto" />
                        </div>
                        
                        <p className="text-gray-700 text-base leading-relaxed max-w-2xl mx-auto">
                            En nuestra veterinaria, cuidamos y amamos a tus mascotas tanto como tú. Con servicios de calidad, personal dedicado y un entorno acogedor, tu tranquilidad y la salud de tus animales son nuestra misión.
                        </p>

                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-100 to-cyan-100 border border-teal-200/50 rounded-2xl backdrop-blur-sm">
                            <Heart className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-semibold text-gray-800">Confía en nosotros para el mejor cuidado</span>
                        </div>
                    </div>

                    {/* Image - Mobile */}
                    <div className="flex justify-center px-4">
                        <div className="relative w-full max-w-md">
                            {/* Decorative background glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-3xl blur-2xl transform scale-105" />
                            
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                                <Image 
                                    src="/assets/people/testimony.png" 
                                    alt="Testimonios de clientes satisfechos" 
                                    width={1000} 
                                    height={805} 
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-12 gap-12 items-center">
                    
                    {/* Image Section - Desktop */}
                    <div className="col-span-6 flex justify-center">
                        <div className="relative w-full max-w-lg">
                            {/* Decorative background glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 to-cyan-200/30 rounded-3xl blur-2xl transform scale-105" />
                            
                            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                                <Image 
                                    src="/assets/people/testimony.png" 
                                    alt="Testimonios de clientes satisfechos" 
                                    width={1000} 
                                    height={805} 
                                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Section - Desktop */}
                    <div className="col-span-6 flex flex-col justify-center space-y-8">
                        
                        {/* Stats badges - Desktop */}
                        <div className="flex gap-4 flex-wrap">
                            <div className="inline-flex items-center gap-2 px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:bg-white/80 transition-all duration-300 group">
                                <div className="p-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <Star className="w-4 h-4 text-white fill-current" />
                                </div>
                                <span className="text-sm font-semibold text-gray-800">5.0 ★★★★★ Rating</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:bg-white/80 transition-all duration-300 group">
                                <div className="p-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-gray-800">500+ Clientes Felices</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-teal-700 to-cyan-700">
                                    Nuestros clientes son nuestra prioridad.
                                </h1>
                                <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                            </div>
                            
                            <p className="text-gray-700 text-lg xl:text-xl leading-relaxed">
                                En nuestra veterinaria, cuidamos y amamos a tus mascotas tanto como tú. Con servicios de calidad, personal dedicado y un entorno acogedor, tu tranquilidad y la salud de tus animales son nuestra misión.
                            </p>
                        </div>

                        {/* Trust badge */}
                        <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-white/70 to-teal-50/70 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:bg-white/80 transition-all duration-300 group w-fit">
                            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-base font-semibold text-gray-800">
                                Confía en nosotros para el mejor cuidado veterinario
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Reviews;
