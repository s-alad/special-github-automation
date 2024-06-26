import { Box, Button, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { useState } from "react";
import { API_URL } from "../../utils/uri";
import { useAuth } from "../../context/auth";

export default function Repos({ reposloading, reposrows }: any) {

    console.log('Repos:', reposrows);
    console.log('Repos loading:', reposloading);

    const { _fetch } = useAuth();

    const reposcolumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', flex: .25 },
        {
            field: 'name',
            headerName: 'name',
            editable: false,
            flex: 1,
        },
        {
            field: 'github_url',
            headerName: 'github url',
            editable: false,
            flex: 1,
        }
    ];

    const [locked, setLocked] = useState(true);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [selectedReposUrls, setSelectedReposUrls] = useState<string[][]>([]);
    async function selectionchange(selection: GridRowSelectionModel) {
        const selectedrepos = selection.map((selected) => [reposrows[selected as number].name, reposrows[selected as number].github_url]);
        console.log('Selected repos:', selectedrepos);
        setSelectedReposUrls(selectedrepos);
    }

    async function setProjectsTo(action: "push" | "pull") {

        if (selectedReposUrls.length === 0) {
            setResults(['No projects selected']);
            return;
        }

        setLoading(true);
        console.log('Setting projects to', action);
        console.log('Selected projects:', selectedReposUrls);

        try {
            const response = await _fetch(`${API_URL}/git/set_projects`, {
                method: 'POST',
                body: JSON.stringify({
                    action: action,
                    projects: selectedReposUrls
                })
            });
            const result = await response.json();
            console.log('Result:', result);
            if (response.ok) {
                console.log('Projects set successfully:', result);
                setResults(result['results']);
            } else throw new Error('Error setting projects');
        } catch (error : any) {
            console.error('Error setting projects:', error);
            setResults([
                'Error setting projects ' + error.toString()
            ]);
        } finally {
            setLoading(false);
            /* callback(); */
        }
    }

    return (
        <>
            <Box sx={{ height: 400, width: '100%', backgroundColor: "#242424", marginBottom: 2 }}>
                <DataGrid
                    rowHeight={28}
                    rows={reposrows}
                    columns={reposcolumns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[10]}
                    disableRowSelectionOnClick
                    checkboxSelection
                    onRowSelectionModelChange={selectionchange}
                    loading={reposloading}
                    style={
                        {
                            backgroundColor: '#fff',
                            color: 'black',
                        }
                    }
                />
            </Box>
            {
                loading ?
                <Box sx={{ display: 'flex', marginTop: 2 }}>
                    <CircularProgress />
                </Box>
                :
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={()=>setLocked(!locked)}>{locked ? '🔒' : '🔓'}</Button>
                    <Button variant='contained' color={locked ? 'error' : 'primary'} onClick={() => {
                        if (locked) { setResults(['Unlock to set projects']);} else {setProjectsTo('pull');}
                    }}>
                        Set selected projects to (pull)
                    </Button>
                    <Button variant='contained' color={locked ? 'error' : 'primary'} onClick={() => {
                        if (locked) { setResults(['Unlock to set projects']);} else { setProjectsTo('push');}
                    }}>
                        Set selected projects to (push)
                    </Button>
                </Box>
            }
            <Box sx={{ width: '100%', backgroundColor: "#242424", marginTop: 2 }}>
                <DataGrid
                    rowHeight={28}
                    rows={results.map((result, index) => ({ id: index, result }))}
                    columns={[
                        { field: 'id', headerName: 'ID', flex: .25 },
                        { field: 'result', headerName: 'Result', flex: 1 }
                    ]}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[10]}
                    disableRowSelectionOnClick
                    style={{
                            minHeight: 140,
                            backgroundColor: '#fff',
                            color: 'black',
                        }}
                />
            </Box>
            
            
        </>
    );
}