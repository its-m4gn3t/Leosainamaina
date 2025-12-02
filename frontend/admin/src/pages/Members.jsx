import React, { useState, useEffect } from 'react';
import Sidebar from '../layout/Sidebar';
import Topbar from '../layout/Topbar';
import Modal from '../components/Modal';
import { useAdminStore } from '../store/useAdminStore';

export default function Members(){
  const { members, addMember, updateMember, deleteMember, fetchMembers } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showPastMembers, setShowPastMembers] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    position: '', 
    image: '', 
    bio: '', 
    password: '',
    generatePassword: true,
    isFoundingMember: false, 
    isActive: true,
    yearJoined: new Date().getFullYear()
  });
  
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openAdd = () => {
    setEditing(null);
    setForm({ 
      name: '', 
      email: '', 
      phone: '', 
      position: '', 
      image: '', 
      bio: '', 
      password: '',
      generatePassword: true,
      isFoundingMember: false, 
      isActive: true,
      yearJoined: new Date().getFullYear()
    });
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member._id);
    setForm({ 
      name: `${member.firstName} ${member.lastName}`.trim(), 
      email: member.email || '', 
      phone: member.phone || '',
      position: member.position || '',
      image: member.image || '',
      bio: member.bio || '',
      password: '',
      generatePassword: false,
      isFoundingMember: member.isFoundingMember || false,
      isActive: member.isActive !== false,
      yearJoined: member.yearJoined || new Date().getFullYear()
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }
    
    if (!editing && form.isActive && !form.email) {
      alert('Email is required for active members to create login credentials');
      return;
    }
    
    // Generate password if needed
    let memberData = { ...form };
    if (!editing && form.isActive && form.generatePassword && form.email) {
      const emailPrefix = form.email.split('@')[0];
      memberData.password = emailPrefix;
    }
    
    try {
      console.log('Saving member:', memberData);
      if (editing) {
        await updateMember(editing, memberData);
        alert('Member updated successfully!');
      } else {
        const result = await addMember(memberData);
        console.log('Member added:', result);
        if (memberData.isActive && memberData.email) {
          alert(`Member added successfully!\n\nLogin Credentials:\nEmail: ${memberData.email}\nPassword: ${memberData.password || 'leo123'}\n\nPlease share these credentials with the member.`);
        } else {
          alert('Member added successfully!');
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Save member error:', error);
      alert(`Failed to save member: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this member?')) {
      try {
        await deleteMember(id);
        alert('Member deleted successfully!');
      } catch (error) {
        console.error('Delete member error:', error);
        alert(`Failed to delete member: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
            <div className="flex gap-3">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setShowPastMembers(false)}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    !showPastMembers
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  👥 Active ({members?.filter(m => m.isActive !== false).length || 0})
                </button>
                <button
                  onClick={() => setShowPastMembers(true)}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    showPastMembers
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📁 Past ({members?.filter(m => m.isActive === false).length || 0})
                </button>
              </div>
              <button
                onClick={openAdd}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Add Member
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members?.filter(member => showPastMembers ? member.isActive === false : member.isActive !== false).map(member => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {member.image ? (
                          <img className="h-10 w-10 rounded-full mr-3" src={member.image} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-700">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                          <div className="text-sm text-gray-500">{member.position || 'Member'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.yearJoined || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                          member.isFoundingMember 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.isFoundingMember ? '🏆 Founding' : '👥 Regular'}
                        </span>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                          member.isActive !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {member.isActive !== false ? '✅ Active' : '📁 Past'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => openEdit(member)}
                        className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="text-red-600 hover:text-red-900 bg-red-100 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {members?.filter(member => showPastMembers ? member.isActive === false : member.isActive !== false).length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      {showPastMembers ? 'No past members found.' : 'No active members yet. Add your first member!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Member' : 'Add Member'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Member name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email {!editing && form.isActive && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="member@example.com"
              required={!editing && form.isActive}
            />
            {!editing && form.isActive && (
              <p className="text-xs text-blue-600 mt-1">
                📧 Required for login credentials
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="9844xxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="President, Secretary, Member, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Brief description about the member"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Joined</label>
              <input
                type="number"
                min="2020"
                max={new Date().getFullYear()}
                value={form.yearJoined}
                onChange={(e) => setForm({ ...form, yearJoined: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex flex-col gap-3 pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFoundingMember"
                  checked={form.isFoundingMember}
                  onChange={(e) => setForm({ ...form, isFoundingMember: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="isFoundingMember" className="ml-2 block text-sm text-gray-700">
                  Founding Member
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Member
                </label>
              </div>
            </div>
          </div>
          
          {/* Login Credentials Section */}
          {!editing && form.isActive && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">🔐 Login Credentials</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="generatePassword"
                    checked={form.generatePassword}
                    onChange={(e) => setForm({ ...form, generatePassword: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="generatePassword" className="ml-2 block text-sm text-blue-700">
                    Auto-generate password from email
                  </label>
                </div>
                
                {!form.generatePassword && (
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Custom Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter custom password"
                    />
                  </div>
                )}
                
                {form.generatePassword && form.email && (
                  <div className="bg-white border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Generated Password:</strong> {form.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Password will be the part before @ in email
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
