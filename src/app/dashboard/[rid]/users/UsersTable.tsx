'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AuthUserRole, AuthUserRoleName } from '@/lib/auth';
import { toggleIsFirstTimeCheckbox } from '@/lib/actions/users';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface UserDB {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: number | null;
  isFirstTime: boolean;
}

interface UsersTableProps {
  users: UserDB[];
}

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5; // number of users per page (editable)

  const editableRoles = [
    AuthUserRole.Guest,
    AuthUserRole.User,
    AuthUserRole.Clerk,
    AuthUserRole.Admin,
    AuthUserRole.God,
  ]; // "Guest" and "God" may be excluded in the future

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
              <th colSpan={5} className="p-4 bg-white">
                <div className="flex justify-center items-center relative">
                  {/* Search bar */}
                  <div className="w-full max-w-md">
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
                          setUsers(initialUsers);
                        } else {
                          setUsers(
                            initialUsers.filter(
                              (u) =>
                                u.role !== null &&
                                AuthUserRoleName[u.role] === value
                            )
                          );
                        }
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>

                        {/* Show ONLY <= Admin and >= User roles to exclude "Guest" and "God" */}
                        {Object.entries(AuthUserRoleName)
                          //.filter(([key]) => AuthUserRole.User <= Number(key) && Number(key) <= AuthUserRole.Admin)
                          .map(([key, label]) => (
                            <SelectItem key={key} value={label}>
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </th>
            </tr>

            {/* Columns row */}
            <tr className="bg-gray-100 text-left">
              <th className="p-3 pl-4 pr-10">Profile</th>
              <th className="p-3 w-40">Name</th>
              <th className="p-3 w-52">Email</th>
              <th className="p-3 w-32 pr-20 text-center">First Interview</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody>
            {usersToShow.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3 pl-4 pr-10 w-20">
                  <Avatar>
                    <AvatarImage src={user.image || undefined} />
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
                <td className="p-3 w-40">{user.name}</td>
                <td className="p-3 w-52">{user.email}</td>
                <td className="p-3 w-32">
                  <div className="flex pr-20 justify-center">
                    <Checkbox
                      checked={user.isFirstTime}
                      onCheckedChange={async () => {
                        // Update the db
                        await toggleIsFirstTimeCheckbox(
                          user.id,
                          user.isFirstTime
                        );

                        // Update local status immediately for visual feedback (optimistic update)
                        setUsers(
                          users.map((u) =>
                            u.id === user.id
                              ? { ...u, isFirstTime: !u.isFirstTime }
                              : u
                          )
                        );
                      }}
                    />
                  </div>
                </td>
                <td className="p-3 w-32">
                  <Select
                    value={
                      user.role !== null ? AuthUserRoleName[user.role] : ''
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No role" />
                    </SelectTrigger>
                    <SelectContent>
                      {editableRoles.map((role) => (
                        <SelectItem key={role} value={AuthUserRoleName[role]}>
                          {AuthUserRoleName[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}

            {/* Separator line below the last row of the table */}
            <tr>
              <td colSpan={5}>
                <hr className="border-t border-gray-200" />
              </td>
            </tr>

            {/* Pagination row */}
            <tr>
              <td colSpan={5} className="p-4 bg-white">
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
