'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 2,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'Admin',
    avatar: '',
  },
  {
    id: 3,
    name: 'Michael Green',
    email: 'michael@example.com',
    role: 'Clerk',
    avatar: '',
  },
  {
    id: 4,
    name: 'Laura Smith',
    email: 'laura@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 5,
    name: 'David Lee',
    email: 'david@example.com',
    role: 'Clerk',
    avatar: '',
  },
  {
    id: 6,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 7,
    name: 'Mark Johnson',
    email: 'mark.j@example.com',
    role: 'Admin',
    avatar: '',
  },
  {
    id: 8,
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    role: 'Clerk',
    avatar: '',
  },
  {
    id: 9,
    name: 'James Miller',
    email: 'james.miller@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 10,
    name: 'Olivia Taylor',
    email: 'olivia.taylor@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 11,
    name: 'Robert Martinez',
    email: 'robert.m@example.com',
    role: 'Clerk',
    avatar: '',
  },
  {
    id: 12,
    name: 'Sophia Harris',
    email: 'sophia.harris@example.com',
    role: 'Admin',
    avatar: '',
  },
  {
    id: 13,
    name: 'Daniel Clark',
    email: 'daniel.c@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 14,
    name: 'Chloe Lewis',
    email: 'chloe.lewis@example.com',
    role: 'Clerk',
    avatar: '',
  },
  {
    id: 15,
    name: 'Benjamin Walker',
    email: 'ben.walker@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 16,
    name: 'Grace Hall',
    email: 'grace.h@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 17,
    name: 'Henry Young',
    email: 'henry.young@example.com',
    role: 'Clerk',
    avatar: '',
  },
  {
    id: 18,
    name: 'Ava King',
    email: 'ava.king@example.com',
    role: 'Admin',
    avatar: '',
  },
  {
    id: 19,
    name: 'Ethan Wright',
    email: 'ethan.wright@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 20,
    name: 'Mia Scott',
    email: 'mia.scott@example.com',
    role: 'Clerk',
    avatar: '',
  },
  {
    id: 21,
    name: 'Emma Watson',
    email: 'emma@example.com',
    role: 'User',
    avatar: '',
  },
  {
    id: 22,
    name: 'Liam Johnson',
    email: 'liam@example.com',
    role: 'Clerk',
    avatar: '',
  },
  {
    id: 23,
    name: 'Olivia Martinez',
    email: 'olivia@example.com',
    role: 'Admin',
    avatar: '',
  },
  {
    id: 24,
    name: 'Noah Davis',
    email: 'noah@example.com',
    role: 'User',
    avatar: '',
  },
];

export default function UsersTable() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // number of users per page (editable)

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const usersToShow = filtered.slice(startIndex, endIndex);

  return (
    <div className="w-full space-y-6">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border shadow-sm">
        <table className="w-full text-sm">
          {/* Header row for search + role filter */}
          <thead>
            <tr>
              <th colSpan={4} className="p-4 bg-white">
                <div className="flex justify-center items-center relative">
                  {/* Search bar */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>

                  {/* Role filter */}
                  <div className="ml-auto flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      Role:
                    </span>
                    <Select
                      onValueChange={(value) => {
                        if (value === 'all') {
                          setUsers(mockUsers);
                        } else {
                          setUsers(mockUsers.filter((u) => u.role === value));
                        }
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="User">User</SelectItem>
                        <SelectItem value="Clerk">Clerk</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </th>
            </tr>

            {/* Columns row */}
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Profile</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody>
            {usersToShow.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">
                  <Avatar>
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 w-40">
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      setUsers((prev) =>
                        prev.map((u) =>
                          u.id === user.id ? { ...u, role: value } : u
                        )
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Clerk">Clerk</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}

            {/* Separator line below the last row of the table */}
            <tr>
              <td colSpan={4}>
                <hr className="border-t border-gray-200" />
              </td>
            </tr>

            {/* Pagination row */}
            <tr>
              <td colSpan={4} className="p-4 bg-white">
                <div className="flex justify-between items-center">
                  {/* Showing X of Y */}
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span>Showing:</span>

                    {/* Page selector */}
                    <select
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={totalPages === 0 ? 0 : currentPage}
                      onChange={(e) => setCurrentPage(Number(e.target.value))}
                      disabled={totalPages === 0}
                    >
                      {totalPages === 0 ? (
                        <option value={0}>0</option>
                      ) : (
                        Array.from({ length: totalPages }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))
                      )}
                    </select>

                    <span>of</span>
                    <span className="font-medium">{totalPages}</span>
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setCurrentPage(Math.max(currentPage - 1, 1))
                      }
                      disabled={currentPage === 1 || totalPages === 0}
                    >
                      Prev
                    </Button>

                    {/* Windowed page numbers: max 3 buttons */}
                    {(() => {
                      if (totalPages === 0) return null;

                      const maxButtons = 3;
                      let startPage = Math.max(currentPage - 1, 1);
                      let endPage = startPage + maxButtons - 1;

                      // Do not exceed the total number of pages
                      if (endPage > totalPages) {
                        endPage = totalPages;
                        startPage = Math.max(endPage - maxButtons + 1, 1);
                      }

                      const pages = [];
                      for (let p = startPage; p <= endPage; p++) {
                        pages.push(
                          <Button
                            key={p}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p)}
                            className={
                              p === currentPage
                                ? 'bg-black text-white hover:bg-black hover:text-white'
                                : 'bg-white text-black border hover:bg-gray-100'
                            }
                          >
                            {p}
                          </Button>
                        );
                      }
                      return pages;
                    })()}

                    <Button
                      variant="ghost"
                      onClick={() =>
                        setCurrentPage(Math.min(currentPage + 1, totalPages))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
