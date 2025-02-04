package com.yugabyte.yw.forms;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.util.UUID;

@ApiModel(description = "Edit backup parameters")
public class EditBackupParams {

  @ApiModelProperty(value = "Time before deleting the backup from storage, in milliseconds")
  public long timeBeforeDeleteFromPresentInMillis = 0L;

  @ApiModelProperty(value = "New backup Storage config")
  public UUID storageConfigUUID = null;
}
