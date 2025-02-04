import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import {
  fetchTablesInUniverse,
  editXClusterTables,
  fetchTaskUntilItCompletes
} from '../../../actions/xClusterReplication';
import { YBModalForm } from '../../common/forms';
import { YBButton, YBInputField } from '../../common/forms/fields';
import { YBLoading } from '../../common/indicators';
import { IReplication, IReplicationTable } from '../IClusterReplication';
import { YSQL_TABLE_TYPE } from '../ReplicationUtils';

import './AddTableToClusterModal.scss';

interface Props {
  onHide: () => void;
  visible: boolean;
  replication: IReplication;
}

export function AddTablesToClusterModal({ visible, onHide, replication }: Props) {
  const { data: tables, isLoading: isTablesLoading } = useQuery(
    [replication.sourceUniverseUUID, 'tables'],
    () => fetchTablesInUniverse(replication.sourceUniverseUUID).then((res) => res.data)
  );

  const [searchText, setSearchText] = useState('');

  const queryClient = useQueryClient();

  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const addTablesToXCluster = useMutation(
    (replication: IReplication) => {
      return editXClusterTables(replication);
    },
    {
      onSuccess: (resp) => {
        onHide();
        fetchTaskUntilItCompletes(resp.data.taskUUID, (err: boolean) => {
          if (!err) {
            queryClient.invalidateQueries(['Xcluster', replication.uuid]);
          } else {
            toast.error(
              <span className="alertMsg">
                <i className="fa fa-exclamation-circle" />
                <span>Unable to add table.</span>
                <a href={`/tasks/${resp.data.taskUUID}`} target="_blank" rel="noopener noreferrer">
                  View Details
                </a>
              </span>
            );
            queryClient.invalidateQueries(['Xcluster', replication.uuid]);
          }
        });
      },
      onError: (err: any) => {
        toast.error(err.response.data.error);
      }
    }
  );

  if (isTablesLoading) {
    return <YBLoading />;
  }

  const tablesInSourceUniverse = tables.map((tables: IReplicationTable) => {
    return {
      ...tables,
      tableUUID: tables.tableUUID.replaceAll('-', '')
    };
  });

  const tablesNotInReplication = tablesInSourceUniverse.filter(
    (t: IReplicationTable) => !replication.tables.includes(t.tableUUID)
  );

  const initialValues = {
    tablesNotInReplication
  };

  const handleRowSelect = (row: IReplicationTable, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTables([...selectedTables, row.tableUUID]);
    } else {
      setSelectedTables([...selectedTables.filter((t) => t !== row.tableUUID)]);
    }
  };

  const handleSelectAll = (isSelected: boolean, row: IReplicationTable[]) => {
    if (isSelected) {
      setSelectedTables([...row.map((t) => t.tableUUID)]);
    } else {
      setSelectedTables([]);
    }
    return true;
  };

  const addTablesToClusterFunc = async (setSubmitting: Function) => {
    const uniqueTables = new Set([...replication.tables, ...selectedTables]);
    try {
      await addTablesToXCluster.mutateAsync({
        ...replication,
        tables: Array.from(uniqueTables)
      });
    } catch {
      setSubmitting(false);
    }
  };

  const resetAndHide = () => {
    setSearchText('');
    onHide();
  };

  return (
    <YBModalForm
      onHide={resetAndHide}
      size="large"
      visible={visible}
      initialValues={initialValues}
      title="Add tables"
      submitLabel={'Apply Changes'}
      onFormSubmit={(_: any, { setSubmitting }: { setSubmitting: Function }) => {
        addTablesToClusterFunc(setSubmitting);
      }}
      footerAccessory={<YBButton btnText="Cancel" onClick={resetAndHide} />}
      render={({ values, setFieldValue }: { values: any; setFieldValue: Function }) => (
        <div className="add-tables-to-cluster">
          <Row className="info-search">
            <Col lg={12} className="info">
              List of tables not replicated
            </Col>
            <Col lg={12}>
              <YBInputField
                placeHolder="Search"
                onValueChanged={(value: string) => setSearchText(value)}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <BootstrapTable
                data={values['tablesNotInReplication'].filter((table: IReplicationTable) => {
                  if (!searchText) {
                    return true;
                  }
                  return table.tableName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
                })}
                height="300"
                tableContainerClass="add-to-table-container"
                selectRow={{
                  mode: 'checkbox',
                  onSelect: handleRowSelect,
                  onSelectAll: handleSelectAll
                }}
              >
                <TableHeaderColumn dataField="tableUUID" isKey={true} hidden />
                <TableHeaderColumn dataField="tableName" width="50%">
                  Name
                </TableHeaderColumn>
                <TableHeaderColumn
                  dataField="tableType"
                  width="20%"
                  dataFormat={(cell) => {
                    if (cell === YSQL_TABLE_TYPE) return 'YSQL';
                    return 'YCQL';
                  }}
                >
                  Type
                </TableHeaderColumn>
                <TableHeaderColumn dataField="keySpace" width="20%">
                  Keyspace
                </TableHeaderColumn>
                <TableHeaderColumn dataField="sizeBytes" width="10%">
                  Size
                </TableHeaderColumn>
              </BootstrapTable>
            </Col>
          </Row>
        </div>
      )}
    />
  );
}
