// AdminBuildDB.js

import React, { useState, useEffect } from "react";
import axios from "axios";
//import Navbar from "./NavBar";
import Layout from "./Layout";

function AdminBuildDB({isAuthenticated}) {
    const [tables, setTables] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        // Fetch tables from the API
        axios.get("http://localhost:8000/builddb")  // Update with your FastAPI server URL
            .then(response => setTables(response.data.tables))
            .catch(error => console.error("Error fetching tables:", error));
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleUploadFile = () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', selectedFile);

        // Send a request to upload the file to the database
        axios.post("http://localhost:8000/upload_to_database", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log("File uploaded successfully.");
                // Optionally, you can perform additional actions after the file is uploaded
            })
            .catch(error => {
                console.error("Error uploading file:", error);
            });
    };

    const handleDeleteTable = (tableName, index) => {
        // Send a request to delete the table
        alert(tableName);

        const confirmDelete = window.confirm(`Are you sure you want to delete table ${tableName}?`);
        if (!confirmDelete) return;


        axios.post(`http://localhost:8000/builddb/delete/${tableName}`)
            // Update with your FastAPI server URL
            .then(response => {
                if (response.data.success) {
                    setTables(prevTables => prevTables.filter((table, i) => i !== index));
                } else {
                    console.error("Error deleting table:", response.data.error);
                }
            })

            .catch(error => console.error("Error deleting table:", error));
    };


    return (
        <Layout isAuthenticated={isAuthenticated}>
            <h1 style={{ color: 'white', textAlign: 'center', margin: '20px 0', fontWeight: 'bold' }}>Tablas En La Bases De Datos</h1>


            <table className="custom-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre De La Tabla</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {tables.map((table, index) => (
                        <tr key={index}>
                            <td>{index}</td>
                            <td>{table}</td>
                            <td>
                                <button className='btn btn-success' onClick={() => handleDeleteTable(table, index)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div class="container-db">
                <h2>Vista Previa</h2>
                <input type="file" onChange={handleFileChange} />
                {selectedFile && (
                    {/* Display file preview or handle file upload */ }
                )}
                <button className='btn btn-primary' onClick={handleUploadFile}>Subir Archivo</button>
            </div>
        </Layout>
    );
}

export default AdminBuildDB;
