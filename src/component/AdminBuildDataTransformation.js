import React, { useState } from "react";
import axios from "axios";
import Papa from 'papaparse';
import { Button, Input } from 'reactstrap';
//import Navbar from "./NavBar";
import Layout from "./Layout";

function DataTransformation({isAuthenticated}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [showFileNameInput, setShowFileNameInput] = useState(false);
    const [showFileNameInput2, setShowFileNameInput2] = useState(false);
    const [showFileNameInput3, setShowFileNameInput3] = useState(false);
    const [showFileNameInput4, setShowFileNameInput4] = useState(false);
    const [showFileNameInput5, setShowFileNameInput5] = useState(false); // New state for removing duplicates
    const [renameColumnFrom, setRenameColumnFrom] = useState('');
    const [renameColumnTo, setRenameColumnTo] = useState('');
    const [removeColumnName, setRemoveColumnName] = useState('');
    const [mergeColumnName1, setMergeColumnName1] = useState('');
    const [mergeColumnName2, setMergeColumnName2] = useState('');
    const [mergeColumnName3, setMergeColumnName3] = useState('');
    const [newTableName, setNewTableName] = useState('');
    const [removeDuplicatesKey, setRemoveDuplicatesKey] = useState(''); // New state for duplicate key fields

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);

        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                Papa.parse(event.target.result, {
                    complete: (result) => {
                        // Merge duplicate columns
                        const mergedData = mergeDuplicateColumns(result.data);
                        setTableData(mergedData);
                    },
                    header: true,
                });
            };

            reader.readAsText(file);
        }
    };

    const mergeDuplicateColumns = (data) => {
        // Find duplicate column names
        const duplicateColumns = Object.keys(data[0]).reduce((acc, key, index, array) => {
            if (array.indexOf(key) !== index) {
                acc[key] = true;
            }
            return acc;
        }, {});

        // Merge duplicate columns by concatenating values
        return data.map(row => {
            Object.keys(row).forEach(key => {
                if (duplicateColumns[key]) {
                    const mergedKey = key;
                    row[mergedKey] = row[key];  // Merge values into one column
                    delete row[key];  // Delete duplicate column
                }
            });
            return row;
        });
    };




    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('file', selectedFile);

        if (renameColumnFrom && renameColumnTo) {
            formData.append('rename_column_old', renameColumnFrom);
            formData.append('rename_column_new', renameColumnTo);
        }

        if (removeColumnName) {
            formData.append('remove_column_name', removeColumnName);
        }

        if (mergeColumnName1 && mergeColumnName2 && mergeColumnName3) {
            formData.append('table1_name', mergeColumnName1);
            formData.append('table2_name', mergeColumnName2);
            formData.append('merge_key', mergeColumnName3);

        }

        if (showFileNameInput4 && newTableName.trim() !== '') {
            formData.append('table_name', newTableName);
        }

        if (showFileNameInput5 && removeDuplicatesKey.trim() !== '') { // Check if showFileNameInput5 is checked and removeDuplicatesKey is not empty
            formData.append('remove_duplicates_key', removeDuplicatesKey); // Use remove_duplicates_key as the parameter name
        }

        try {
            const response = await axios.post('http://localhost:8000/cleanData', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert("Data cleaned successfully!");
            } else {
                alert("Data cleaning failed!");
            }
        } catch (error) {
            alert("An error occurred while cleaning data!");
        }
    };

    return (
        <Layout isAuthenticated={isAuthenticated}>
            <div className="container" style={{ height: '100%', justifyContent: 'center' }}>
                <br />
                <div className="container-dt" style={{display:"flex", flexDirection:'column', alignItems:"center"}}>
                <h1 style={{ color: 'white', fontWeight: 'bold' }}>Data Transformation</h1><br />

                    <h2>Archivo </h2>
                        <input type="file" onChange={handleFileChange} style={{margin:'10px'}} />
                    {selectedFile && (
                        <div>
                            <h2>Contenido</h2>
                            <table className="custom-table">
                                <thead>
                                    {tableData.length > 0 && (
                                        <tr>
                                            {Object.keys(tableData[0]).map((header, index) => (
                                                <th key={index}>{header}</th>
                                            ))}
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {tableData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {Object.values(row).map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <br />
                <div className="container-dt">
                    <form action="" onSubmit={handleSubmit}>
                        <label>
                            <Input type="checkbox" onChange={() => setShowFileNameInput(!showFileNameInput)} />
                            Renombrar Columna?
                        </label>
                        {showFileNameInput && (
                            <div>
                                <input type="text" class="form-control" value={renameColumnFrom} onChange={(e) => setRenameColumnFrom(e.target.value)} style={{ margin: '10px' }} placeholder="Desde" />
                                <input type="text" class="form-control" value={renameColumnTo} onChange={(e) => setRenameColumnTo(e.target.value)} style={{ margin: '10px' }} placeholder="Hasta" />

                            </div>
                        )}
                        <br />
                        <label>
                            <Input type="checkbox" onChange={() => setShowFileNameInput2(!showFileNameInput2)} />
                            Remover Columna?
                        </label>
                        {showFileNameInput2 && (
                            <div>
                                <input type="text" placeholder="Columna A Remover" class="form-control" value={removeColumnName} onChange={(e) => setRemoveColumnName(e.target.value)} style={{ margin: '10px' }} />
                            </div>
                        )}
                        <br />
                        <label>
                            <Input type="checkbox" onChange={() => setShowFileNameInput3(!showFileNameInput3)} />
                            Unir Tablas
                        </label>
                        {showFileNameInput3 && (
                            <div align="text-center">
                                <input type="text" placeholder="Primer Tabla" class="form-control" value={mergeColumnName1} onChange={(e) => setMergeColumnName1(e.target.value)} style={{ margin: '10px' }} />
                                <input type="text" placeholder="Segunda Tabla" class="form-control" value={mergeColumnName2} onChange={(e) => setMergeColumnName2(e.target.value)} style={{ margin: '10px' }} />

                                <input type="text" placeholder="Nombre Key" class="form-control" value={mergeColumnName3} onChange={(e) => setMergeColumnName3(e.target.value)} style={{ margin: '10px' }} />
                            </div>
                        )}
                        <br />
                        <label>
                            <Input type="checkbox" onChange={() => setShowFileNameInput4(!showFileNameInput4)} />
                            Añadir Tabla
                        </label>
                        {showFileNameInput4 && (
                            <div>
                                <input type="text" placeholder="Nombre Tabla" class="form-control" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} style={{ margin: '10px' }} />
                            </div>
                        )}
                        <br />
                        <label>
                            <Input type="checkbox" onChange={() => setShowFileNameInput5(!showFileNameInput5)} />
                            Quieres Remover Campos Duplicados?
                        </label>
                        {showFileNameInput5 && (
                            <div>
                                <input type="text" placeholder="ID Campos Duplicados" class="form-control" value={removeDuplicatesKey} onChange={(e) => setRemoveDuplicatesKey(e.target.value)} style={{ margin: '10px' }} />
                            </div>
                        )}
                        <br />
                        <Button color="success" class="btn-round btn btn-primary btn-lg">Finish</Button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default DataTransformation;
