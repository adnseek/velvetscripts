"use client";

import { useState } from "react";
import { Wand2, Plus, BookOpen, Users, Tag } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verwalte deine Geschichten und Camgirl-Affiliate-Links
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Link
            href="/admin/stories/new"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Wand2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Neue Geschichte
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Erstelle eine neue erotische Geschichte mit KI und füge Affiliate-Links hinzu
            </p>
          </Link>

          <Link
            href="/admin/stories"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <BookOpen className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                Geschichten verwalten
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Bearbeite, veröffentliche oder lösche bestehende Geschichten
            </p>
          </Link>

          <Link
            href="/admin/camgirls"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Camgirls verwalten
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Verwalte Camgirl-Profile und Affiliate-Links
            </p>
          </Link>

          <Link
            href="/admin/tags"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Tag className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Kategorien & Tags
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Kategorien, Tags und Auto-Tagging Keywords verwalten
            </p>
          </Link>

          <Link
            href="/"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Zur Website
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Zeige die öffentliche Website an
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
